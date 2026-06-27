import HeliportDesigner from "@/components/HeliportDesigner";
import { SIMULATOR_MODE } from "@/lib/simulatorMode";

export const metadata = {
  title: "Mode Tugas - Heliport Design Simulator",
  description: "Tugas desain heliport tanpa bantuan dimensi minimum; hasil muncul di PDF submit.",
};

export default function TugasPage() {
  return <HeliportDesigner mode={SIMULATOR_MODE.TUGAS} />;
}
