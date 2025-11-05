import { useSigma } from "@react-sigma/core";
import { FC, PropsWithChildren, useEffect } from "react";

import { FiltersState } from "../types";

const GraphDataController: FC<PropsWithChildren<{ filters: FiltersState }>> = ({ filters, children }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  /**
   * Apply filters to graphology:
   */
  useEffect(() => {
    const { manufactures, regions, models } = filters;
    graph.forEachNode((node, attributes) => {
      const isVisible = manufactures[attributes.manufacture] && 
                       regions[attributes.region] && 
                       models[attributes.model];
      graph.setNodeAttribute(node, "hidden", !isVisible);
    });
  }, [graph, filters]);

  return <>{children}</>;
};

export default GraphDataController;
