import { Link, useLocation } from "react-router-dom";
import SiriOrb from "@/components/smoothui/ui/SiriOrb";
import useWorkspaceId from "@/hooks/use-workspace-id";

const AiFab = () => {
  const location = useLocation();
  const workspaceId = useWorkspaceId();

  const isAiPage = location.pathname.includes("/ai");
  if (isAiPage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        to={`/workspace/${workspaceId}/ai`}
        className="flex items-center gap-2 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-background/80 backdrop-blur border px-3 py-2"
        aria-label="Open AI assistant"
      >
        <div><SiriOrb size="24px" /></div>
        <span className="text-sm font-medium mr-1">Спросить у ии</span>
      </Link>
    </div>
  );
};

export default AiFab;


