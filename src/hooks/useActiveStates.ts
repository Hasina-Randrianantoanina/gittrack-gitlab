import { useLegendContext } from "@/context/LegendContext";

const useActiveStates = () => {
  const { activeStates } = useLegendContext();
  return activeStates;
};

export default useActiveStates;
