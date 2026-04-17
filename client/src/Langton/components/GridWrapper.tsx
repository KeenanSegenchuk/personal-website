import LangstonGrid from "../LangstonGrid";
import StepController from "../controllers/StepController";
import AntTypeController, { AntType } from "../controllers/AntTypeController";
import PromptController from "../controllers/PromptController";
import AntConfigController from "../controllers/AntConfigController";
import NColorsController from "../controllers/NColorsController";
import SaveConfigController from "../controllers/SaveConfigController";
import GridContext from "../controllers/GridContext";
import React, {useRef, useEffect, useState} from 'react';
import axios from "axios";

type GridPlayerProps = {
  title: string;
  width: number;
  height: number;
  gridDimensions: string;
  initialType?: AntType;
};

type LoadState =
  | { status: "loading" }
  | { status: "ready"; controller: StepController }
  | { status: "error"; error: unknown };

function GridWrapper({title, width, height, gridDimensions, initialType = "ant"}: GridPlayerProps) {
  const [ctx] = useState(() => new GridContext({ antType: initialType, nColors: 3, lastConfig: null }));
  const [antTypeController] = useState(() => new AntTypeController(initialType, ctx));
  const [promptController] = useState(() => new PromptController(ctx));
  const [antConfigController] = useState(() => new AntConfigController(ctx));
  const [nColorsController] = useState(() => new NColorsController(ctx));
  const [saveConfigController] = useState(() => new SaveConfigController(ctx));
  const [gridId, setGridId] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMountedRef = useRef(true);
  const prevGridId = useRef(-1);
  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const gridRef = useRef<LangstonGrid | null>(null);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(c => {if(c<3) return c+1; else return 1;}), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const getNewAnt = () => {
    if (cooldown > 0) return;
    setGridId(prev => prev + 1);
    setCooldown(1);
  };

  const init = async (type: AntType) => {
    setState({ status: "loading" });
    ctx.set("lastConfig", null);
    console.log("Loading new LangtonGrid");

    const oldGrid = gridRef.current;
    if (oldGrid?.controller) {
      oldGrid.controller.stop();
      oldGrid.controller.unsubscribeAll();
    }

    let config: string | undefined;
    if (type === "custom") {
      config = antConfigController.config;
    } else if (type === "random") {
      try {
        const nColors = ctx.get("nColors");
        const prompt = promptController.prompt;
        const url = prompt
          ? `http://localhost:5000/api/langton/ant_config/${nColors}/${encodeURIComponent(prompt)}`
          : `http://localhost:5000/api/langton/ant_config/${nColors}`;
        const res = await axios.get<string>(url);
        console.log("Received custom ant config:", res.data);
        config = res.data;
        ctx.set("lastConfig", res.data);
      } catch (err) {
        console.error("Error fetching config:", err);
        setState({ status: "error", error: err });
        return;
      }
    }

    const grid = new LangstonGrid(
      type,
      gridDimensions,
      width,
      height,
      canvasRef,
      (ctrl) => {
        console.log("Created Controller.");
        setState({ status: "ready", controller: ctrl });
      },
      config
    );
    gridRef.current = grid;
  };

  useEffect(() => {
    if (gridId !== prevGridId.current) {
      prevGridId.current = gridId;
      init(antTypeController.antType);
    }
  }, [gridId]);

  // Wire renderCanvas + renderCallback once a controller is available.
  useEffect(() => {
    if (state.status !== "ready") return;
    setCooldown(0);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    console.log("Init rendering Canvas:");
    gridRef.current!.renderCanvas(ctx);
    state.controller.renderCallback = () => gridRef.current!.renderCanvas(ctx);
    state.controller.onToggle();
  }, [state, gridRef]);

  return (
    <div style={{margin: "35px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px solid rgba(100, 200, 230, 0.35)", borderRadius: "6px", background: "rgba(4, 18, 55, 0.65)", backdropFilter: "blur(4px)"}}>
      <h2 className="langton-grid-title">{title}</h2>
      {state.status === "loading" && <div style={{color: "#9dd8ec", padding: "8px"}}>Loading...</div>}
      {state.status === "error" && (
        <div style={{ color: "#ff6680", padding: "8px" }}>
          Failed to load grid: {String((state as {status:"error";error:unknown}).error)}
        </div>
      )}
      {state.status === "ready" && (
        <ControllerWrapper
          controller={state.controller}
          antTypeController={antTypeController}
          promptController={promptController}
          antConfigController={antConfigController}
          nColorsController={nColorsController}
          saveConfigController={saveConfigController}
          onNewAnt={getNewAnt}
          cooldown={cooldown}
        />
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ display: "block" }}
      />
    </div>
  );
}

export default GridWrapper;

function ControllerWrapper({ controller, antTypeController, promptController, antConfigController, nColorsController, saveConfigController, onNewAnt, cooldown }: {
  controller: StepController;
  antTypeController: AntTypeController;
  promptController: PromptController;
  antConfigController: AntConfigController;
  nColorsController: NColorsController;
  saveConfigController: SaveConfigController;
  onNewAnt: () => void;
  cooldown: number;
}) {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);

  React.useEffect(() => {
    const unsubStep   = controller.subscribe(() => forceUpdate());
    const unsubType   = antTypeController.subscribe(() => forceUpdate());
    const unsubPrompt = promptController.subscribe(() => forceUpdate());
    const unsubConfig = antConfigController.subscribe(() => forceUpdate());
    const unsubNColors = nColorsController.subscribe(() => forceUpdate());
    const unsubSave   = saveConfigController.subscribe(() => forceUpdate());
    return () => {
      unsubStep?.();
      unsubType?.();
      unsubPrompt();
      unsubConfig();
      unsubNColors();
      unsubSave();
    };
  }, [controller, antTypeController, promptController, antConfigController, nColorsController, saveConfigController]);

  return (
    <>
      {controller.render()}
      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", gap: "16px" }}>
        {antTypeController.render()}
        {nColorsController.render()}
        {promptController.render()}
        {antConfigController.render()}
      </div>
      <button className="langton-btn" onClick={onNewAnt} disabled={cooldown > 0}>
        {cooldown > 0 ? `Generating Ant` + ".".repeat(cooldown) : "Generate New Ant"}
      </button>
      {saveConfigController.render()}
    </>
  );
}
