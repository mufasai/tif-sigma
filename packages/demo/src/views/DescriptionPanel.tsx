import { FC } from "react";
import { BsInfoCircle } from "react-icons/bs";

import Panel from "./Panel";

const DescriptionPanel: FC = () => {
  return (
    <Panel
      initiallyDeployed
      title={
        <>
          <BsInfoCircle className="text-muted" /> Description
        </>
      }
    >
      <p>
        This map represents a <i>network</i> of infrastructure switches across multiple regions in Indonesia. Each{" "}
        <i>node</i> represents a network switch, and connections show the network topology between switches.
      </p>
      <p>
        The switches are from various manufacturers including Cisco, Huawei, Arista, Juniper, and MikroTik. Each switch 
        has detailed information including the model, region, port utilization, and geographic coordinates.
      </p>
      <p>
        Node sizes represent port utilization percentage - larger nodes indicate switches with higher port usage. 
        Colors represent different manufacturers, making it easy to identify equipment distribution across the network.
      </p>
      <p>
        You can hover over any switch to see detailed information including hostname, manufacturer, model, region, 
        port usage statistics, and utilization percentage. Use the search functionality to quickly locate specific switches.
      </p>
    </Panel>
  );
};

export default DescriptionPanel;
