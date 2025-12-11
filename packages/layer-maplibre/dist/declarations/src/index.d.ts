import Graph from "graphology";
import { Attributes } from "graphology-types";
import { Map, MapOptions } from "maplibre-gl";
import { Sigma } from "sigma";
import { graphToLatlng, latlngToGraph } from "./utils.js";
/**
 * On the graph, we store the 2D projection of the geographical lat/long.
 *
 * @param sigma The sigma instance
 * @param opts.mapOptions Options that will be provided to map constructor.
 * @param opts.getNodeLatLng Function to retrieve lat/long values from a node's attributs (default is lat & lng)
 */
export default function bindMaplibreLayer(sigma: Sigma, opts?: {
    mapOptions?: Omit<MapOptions, "container" | "center" | "zoom" | "minPitch" | "maxPitch">;
    getNodeLatLng?: (nodeAttributes: Attributes) => {
        lat: number;
        lng: number;
    };
}): {
    clean: () => void;
    map: Map;
    updateGraphCoordinates: (graph: Graph) => void;
};
export { graphToLatlng, latlngToGraph };
