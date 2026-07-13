import { DeviceIntelligenceView } from "@/components/device-intelligence/DeviceIntelligenceView";
import type { Device } from "@/lib/api";

export default function SpecsTable({ device }: { device: Device }) {
  return <DeviceIntelligenceView device={device} density="standard" />;
}
