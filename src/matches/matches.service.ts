import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import {
  Action,
  MatchAction,
  MatchActionDocument,
} from './schemas/match-action.schema';
@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(MatchAction.name)
    private readonly matchActionModel: Model<MatchActionDocument>,
  ) {}
  async getTopMatches(currentUserId: string) {
    // Fetch the current user's full profile
    const currentUser = await this.userModel.findById(currentUserId).exec();
    if (!currentUser) return [];

    // Find all users this person has already liked or passed
    // So we don't show the same profile twice
    const seenActions = await this.matchActionModel
      .find({ fromUser: currentUserId })
      .select('toUser')
      .exec();

    const seenUserIds = seenActions.map((a) => a.toUser);

    // Query candidates with hard filters
    // These are non-negotiable — if they don't match preferences, skip entirely
    const filterQuery: Record<string, any> = {
      _id: {
        $ne: new Types.ObjectId(currentUserId), // exclude self
        $nin: seenUserIds, // exclude already seen
      },
      age: {
        $gte: currentUser.preferredAgeMin, // within preferred age range
        $lte: currentUser.preferredAgeMax,
      },
    };

    // Only filter by gender if the user has a preference set
    if (currentUser.preferredGender) {
      filterQuery.gender = currentUser.preferredGender;
    }

    const candidates = await this.userModel
      .find(filterQuery)
      .select('-password')
      .exec();

    // Score each candidate
    const scored = candidates.map((candidate) => {
      const score = this.calculateScore(currentUser, candidate);
      return { candidate, score };
    });

    // Sort by score descending, return top 10
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ candidate, score }) => ({
        user: candidate,
        compatibilityScore: Math.round(score * 100), // return as percentage e.g. 75
      }));
  }

  private calculateScore(
    currentUser: UserDocument,
    candidate: UserDocument,
  ): number {
    let score = 0;

    // ── Factor 1: Shared Interests (Jaccard Similarity) ─────────────
    // Jaccard = shared interests / total unique interests
    // e.g. A = [hiking, chess], B = [chess, cooking]
    // shared = 1 (chess), total unique = 3 → score = 0.33
    const sharedInterests = currentUser.interests.filter((interest) =>
      candidate.interests.includes(interest),
    ).length;

    const totalUniqueInterests = new Set([
      ...currentUser.interests,
      ...candidate.interests,
    ]).size;

    const interestScore =
      totalUniqueInterests > 0 ? sharedInterests / totalUniqueInterests : 0;

    // Simple city match — same city = full points
    const locationScore = currentUser.city === candidate.city ? 1 : 0;

    // Does the candidate also prefer our age range?
    // Rewards mutual compatibility, not just one-sided
    const ageScore =
      currentUser.age >= candidate.preferredAgeMin &&
      currentUser.age <= candidate.preferredAgeMax
        ? 1
        : 0;

    // Interests weighted highest since it's the most meaningful signal
    score = interestScore * 0.5 + locationScore * 0.3 + ageScore * 0.2;

    return score; // value between 0 and 1
  }

  async recordAction(fromUserId: string, toUserId: string, action: Action) {
    // Make sure the target user actually exists
    const targetUser = await this.userModel.findById(toUserId).exec();
    if (!targetUser) throw new NotFoundException('User not found');

    // If action already exists update it, otherwise create it
    // Handles edge case where user likes → passes the same person
    await this.matchActionModel
      .findOneAndUpdate(
        { fromUser: fromUserId, toUser: toUserId },
        { action },
        { upsert: true, new: true },
      )
      .exec();

    // If it's a like, check for a mutual match
    if (action === Action.LIKE) {
      const mutualLike = await this.matchActionModel
        .findOne({
          fromUser: toUserId, // the other person
          toUser: fromUserId, // liked us back
          action: Action.LIKE,
        })
        .exec();

      // Both users liked each other — it's a match!
      if (mutualLike) {
        return { message: 'Its a match!', mutual: true };
      }
    }

    return { message: 'Action recorded', mutual: false };
  }

  async getMutualMatches(currentUserId: string) {
    // Find everyone the current user has liked
    const myLikes = await this.matchActionModel
      .find({ fromUser: currentUserId, action: Action.LIKE })
      .select('toUser')
      .exec();

    const myLikedUserIds = myLikes.map((a) => a.toUser);

    // From those, find who also liked us back
    const mutualActions = await this.matchActionModel
      .find({
        fromUser: { $in: myLikedUserIds }, // they liked someone
        toUser: currentUserId, // that someone is us
        action: Action.LIKE,
      })
      .select('fromUser')
      .exec();

    const mutualUserIds = mutualActions.map((a) => a.fromUser);

    // Fetch their profiles
    const mutualUsers = await this.userModel
      .find({ _id: { $in: mutualUserIds } })
      .select('-password')
      .exec();

    return mutualUsers;
  }
}
