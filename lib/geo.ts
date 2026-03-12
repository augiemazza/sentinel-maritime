import * as THREE from "three";

/**
 * Convert geographic lat/lon to a 3D point on the unit sphere.
 * r slightly above 1.0 places the object just above the globe surface.
 */
export function latLonToVec3(
  lat: number,
  lon: number,
  r = 1.005
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * Compute a quaternion that orients an object placed at `pos` on the sphere
 * to point "up" away from the globe center (radially outward), and face
 * the given heading (degrees clockwise from north).
 */
export function orientOnSphere(
  pos: THREE.Vector3,
  headingDeg: number
): THREE.Quaternion {
  // "up" = radial direction (outward from globe center)
  const up = pos.clone().normalize();

  // North tangent at this position: d(pos)/d(lat), simplified
  const phi = Math.acos(up.y);
  const theta = Math.atan2(up.z, -up.x);
  const north = new THREE.Vector3(
    -Math.cos(phi) * Math.cos(theta),
    Math.sin(phi),
    -Math.cos(phi) * Math.sin(theta)
  ).normalize();

  // Rotate north by heading around the up axis
  const headingRad = (headingDeg * Math.PI) / 180;
  const forward = north
    .clone()
    .applyAxisAngle(up, -headingRad)
    .normalize();

  // Build orthonormal basis: right = forward x up
  const right = new THREE.Vector3().crossVectors(forward, up).normalize();
  const correctedForward = new THREE.Vector3().crossVectors(up, right).normalize();

  const m = new THREE.Matrix4().makeBasis(right, up, correctedForward.negate());
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

/**
 * Haversine distance in nautical miles between two lat/lon points.
 */
export function haversineNm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3440.065; // Earth radius in nautical miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
