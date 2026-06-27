import HeliportDesigner from "@/components/HeliportDesigner";
import { SIMULATOR_MODE } from "@/lib/simulatorMode";

export const metadata = {
  title: "Mode Latihan - Heliport Design Simulator",
  description: "Latihan desain heliport dengan dimensi minimum dan cek hasil langsung.",
};

export default function LatihanPage() {
  return <HeliportDesigner mode={SIMULATOR_MODE.LATIHAN} />;
}
