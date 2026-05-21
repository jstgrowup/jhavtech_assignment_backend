import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import {
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
  async getTopMatches(currentUserId: string): Promise<object[]> {
    // Step 1 — fetch the current user's full profile
    const currentUser = await this.userModel.findById(currentUserId).exec();
    if (!currentUser) return [];

    // Step 2 — find all users this person has already liked or passed
    // So we don't show the same profile twice
    const seenActions = await this.matchActionModel
      .find({ fromUser: currentUserId })
      .select('toUser')
      .exec();

    const seenUserIds = seenActions.map((a) => a.toUser);

    // Step 3 — query candidates with hard filters
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

    // Step 4 — score each candidate
    const scored = candidates.map((candidate) => {
      const score = this.calculateScore(currentUser, candidate);
      return { candidate, score };
    });

    // Step 5 — sort by score descending, return top 10
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

    // ── Factor 2: Location ───────────────────────────────────────────
    // Simple city match — same city = full points
    const locationScore = currentUser.city === candidate.city ? 1 : 0;

    // ── Factor 3: Age Preference Match ───────────────────────────────
    // Does the candidate also prefer our age range?
    // Rewards mutual compatibility, not just one-sided
    const ageScore =
      currentUser.age >= candidate.preferredAgeMin &&
      currentUser.age <= candidate.preferredAgeMax
        ? 1
        : 0;

    // ── Weighted Final Score ─────────────────────────────────────────
    // Interests weighted highest since it's the most meaningful signal
    score = interestScore * 0.5 + locationScore * 0.3 + ageScore * 0.2;

    return score; // value between 0 and 1
  }
}
