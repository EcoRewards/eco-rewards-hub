export const maxDistance = 99;
export const maxTrainDistance = 500;

const maxDistanceByMode: Record<string, number> = {
  "train": maxTrainDistance
};

export const distanceTooLargeError =
  `Travel distance must not exceed ${maxDistance} miles or ${maxTrainDistance} miles for train journeys`;
export const distanceNegativeError = "Travel distance must not be negative";

/**
 * Upper bound for a journey distance in the given transport mode
 */
export function getMaxDistance(mode?: string | null): number {
  return maxDistanceByMode[mode?.toLowerCase() ?? ""] ?? maxDistance;
}

/**
 * Validate a distance against the limit for the given transport mode
 */
export function getDistanceErrors(distance: number, mode?: string | null): string[] {
  if (isNaN(distance)) {
    return ["Travel distance must be a number"];
  }
  if (distance < 0) {
    return [distanceNegativeError];
  }
  if (distance > getMaxDistance(mode)) {
    return [distanceTooLargeError];
  }

  return [];
}
