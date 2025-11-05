import { Settings } from "sigma/settings";
import { NodeDisplayData, PartialButFor, PlainObject } from "sigma/types";

const TEXT_COLOR = "#000000";

/**
 * This function draw in the input canvas 2D context a rectangle.
 * It only deals with tracing the path, and does not fill or stroke.
 */
export function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Custom hover renderer
 */
export function drawHover(context: CanvasRenderingContext2D, data: PlainObject, settings: PlainObject) {
  const size = settings.labelSize;
  const font = settings.labelFont;
  const weight = settings.labelWeight;
  const subLabelSize = size - 2;

  const hostname = data.hostname || data.label;
  const manufacture = data.manufacture || "";
  const model = data.model || "";
  const region = data.region || "";
  const portUsage = data.port_used ? `${data.port_used}/${data.port_used + data.port_idle} ports` : "";
  const percentage = data.percentage_used ? `${data.percentage_used.toFixed(1)}% used` : "";

  // Then we draw the label background
  context.beginPath();
  context.fillStyle = "#fff";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 2;
  context.shadowBlur = 8;
  context.shadowColor = "#000";

  context.font = `${weight} ${size}px ${font}`;
  const hostnameWidth = context.measureText(hostname).width;
  context.font = `${weight} ${subLabelSize}px ${font}`;
  const manufactureModelWidth = context.measureText(`${manufacture} ${model}`).width;
  const regionWidth = context.measureText(region).width;
  const portUsageWidth = portUsage ? context.measureText(portUsage).width : 0;
  const percentageWidth = percentage ? context.measureText(percentage).width : 0;

  const textWidth = Math.max(hostnameWidth, manufactureModelWidth, regionWidth, portUsageWidth, percentageWidth);

  const x = Math.round(data.x);
  const y = Math.round(data.y);
  const w = Math.round(textWidth + size / 2 + data.size + 3);
  const hLabel = Math.round(size / 2 + 4);
  const hSubLabel = Math.round(subLabelSize / 2 + 9);
  const totalHeight = hLabel + (hSubLabel * 4) + 12; // 4 lines of sub-labels

  drawRoundRect(context, x, y - (hSubLabel * 3) - 12, w, totalHeight, 5);
  context.closePath();
  context.fill();

  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 0;

  // Draw the labels
  context.fillStyle = TEXT_COLOR;
  context.font = `${weight} ${size}px ${font}`;
  context.fillText(hostname, data.x + data.size + 3, data.y + size / 3);

  if (manufacture && model) {
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(`${manufacture} ${model}`, data.x + data.size + 3, data.y - (2 * size) / 3 - 2);
  }

  if (region) {
    context.fillStyle = data.color || TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(region, data.x + data.size + 3, data.y + size / 3 + 3 + subLabelSize);
  }

  if (portUsage) {
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(portUsage, data.x + data.size + 3, data.y + size / 3 + 6 + (subLabelSize * 2));
  }

  if (percentage) {
    context.fillStyle = TEXT_COLOR;
    context.font = `${weight} ${subLabelSize}px ${font}`;
    context.fillText(percentage, data.x + data.size + 3, data.y + size / 3 + 9 + (subLabelSize * 3));
  }
}

/**
 * Custom label renderer
 */
export function drawLabel(
  context: CanvasRenderingContext2D,
  data: PartialButFor<NodeDisplayData, "x" | "y" | "size" | "label" | "color">,
  settings: Settings,
): void {
  if (!data.label) return;

  const size = settings.labelSize,
    font = settings.labelFont,
    weight = settings.labelWeight;

  context.font = `${weight} ${size}px ${font}`;
  const width = context.measureText(data.label).width + 8;

  context.fillStyle = "#ffffffcc";
  context.fillRect(data.x + data.size, data.y + size / 3 - 15, width, 20);

  context.fillStyle = "#000";
  context.fillText(data.label, data.x + data.size + 3, data.y + size / 3);
}
