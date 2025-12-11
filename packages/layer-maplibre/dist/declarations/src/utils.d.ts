import { Map } from "maplibre-gl";
import { Sigma } from "sigma";
export declare const MAX_VALID_LATITUDE = 85.051129;
/**
 * Given a geo point returns its graph coords.
 */
export declare function latlngToGraph(map: Map, coord: {
    lat: number;
    lng: number;
}): {
    x: number;
    y: number;
};
/**
 * Given a graph coords returns its lat/lng coords.
 */
export declare function graphToLatlng(map: Map, coords: {
    x: number;
    y: number;
}): {
    lat: number;
    lng: number;
};
/**
 * BBOX sync : map to sigma
 */
export declare function syncSigmaWithMap(sigma: Sigma, map: Map): void;
/**
 * BBOX sync : sigma to map
 */
export declare function syncMapWithSigma(sigma: Sigma, map: Map): void;
