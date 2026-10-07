export const maxDistance = 99;
export const maxTrainDistance = 500;

/**
 * A Map rather than an object literal so that a mode of "constructor" or "__proto__" cannot
 * resolve to an inherited property and slip past the limit.
 */
const maxDistanceByMode = new Map([
  ["train", maxTrainDistance]
]);

export const distanceNotANumberError = "Travel distance must be a number";
export const distanceNegativeError = "Travel distance must not be negative";
export const distanceTooLargeError =
  `Travel distance must not exceed ${maxDistance} miles or ${maxTrainDistance} miles for train journeys`;

/**
 * Upper bound for a journey distance in the given transport mode
 */
export function getMaxDistance(mode?: string | null): number {
  return maxDistanceByMode.get(mode?.toLowerCase() ?? "") ?? maxDistance;
}

/**
 * Validate a distance against the limit for the given transport mode
 */
export function validateDistance(distance: number, mode?: string | null): string[] {
  if (isNaN(distance)) {
    return [distanceNotANumberError];
  }
  if (distance < 0) {
    return [distanceNegativeError];
  }
  if (distance > getMaxDistance(mode)) {
    return [distanceTooLargeError];
  }

  return [];
}
