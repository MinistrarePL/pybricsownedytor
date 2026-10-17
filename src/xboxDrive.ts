import { generatePreamble } from './robot.ts';
import type { Device, RobotProfile } from './types.ts';

export const XBOX_SPEED_MIN = 200;
export const XBOX_SPEED_MAX = 800;
export const XBOX_SPEED_DEFAULT = 400;
const ARM_DC = 50;

export function clampXboxSpeed(value: number): number {
  if (!Number.isFinite(value)) {
    return XBOX_SPEED_DEFAULT;
  }
  return Math.min(XBOX_SPEED_MAX, Math.max(XBOX_SPEED_MIN, Math.round(value)));
}

export function xboxArmDevice(robot: RobotProfile): Device | undefined {
  const drive = robot.driveBase;
  if (!drive) {
    return undefined;
  }
  const extras = robot.devices.filter(
    (device) => device.kind === 'motor' && device.id !== drive.left && device.id !== drive.right,
  );
  return extras.find((device) => device.id === 'ramie') ?? extras[0];
}

function xboxProfile(robot: RobotProfile): RobotProfile {
  const drive = robot.driveBase;
  if (!drive) {
    throw new Error('Ten model nie jeździ. Wybierz model z kołami.');
  }
  const wheels = robot.devices.filter((device) => device.id === drive.left || device.id === drive.right);
  const arm = xboxArmDevice(robot);
  return {
    ...robot,
    devices: arm ? [...wheels, arm] : wheels,
    driveBase: { ...drive, useGyro: false },
  };
}

export function generateXboxDriveProgram(robot: RobotProfile, options?: { maxSpeed?: number }): string {
  if (!robot.driveBase) {
    throw new Error('Ten model nie jeździ. Wybierz model z kołami.');
  }
  const maxSpeed = clampXboxSpeed(options?.maxSpeed ?? XBOX_SPEED_DEFAULT);
  const preamble = generatePreamble(xboxProfile(robot)).replace(
    'from pybricks.tools import wait, StopWatch',
    'from pybricks.iodevices import XboxController\nfrom pybricks.tools import wait, StopWatch',
  );
  const left = robot.driveBase.left;
  const right = robot.driveBase.right;
  const leftPort = robot.devices.find((device) => device.id === left)?.port ?? '?';
  const rightPort = robot.devices.find((device) => device.id === right)?.port ?? '?';
  const arm = xboxArmDevice(robot);
  const armVar = arm ? `d_${arm.id}` : '';
  const cableHint = arm
    ? `Sprawdz kable kol w portach ${leftPort} i ${rightPort} oraz ramienia w porcie ${arm.port}.`
    : `Sprawdz kable kol w portach ${leftPort} i ${rightPort}.`;
  const armControl = arm
    ? [
        '        przyciski = pad.buttons.pressed()',
        `        if Button.UP in przyciski:`,
        `            ${armVar}.dc(${ARM_DC})`,
        `        elif Button.DOWN in przyciski:`,
        `            ${armVar}.dc(${-ARM_DC})`,
        '        else:',
        `            ${armVar}.stop()`,
      ]
    : [];
  const armStop = arm
    ? [`            ${armVar}.stop()`]
    : [];
  const body = [
    `MAX = ${maxSpeed}`,
    '',
    'def polacz_pad():',
    '    print("Szukam pada Xbox...")',
    '    print("Jesli nie laczy: przycisk parowania z tylu, az logo szybko miga.")',
    '    blad = None',
    '    for proba in range(1, 5):',
    '        try:',
    '            pad = XboxController(timeout=8000)',
    '            print("Pad polaczony")',
    '            return pad',
    '        except Exception as e:',
    '            blad = e',
    '            print("Proba", proba, "nie wyszla:", e)',
    '            wait(800)',
    '    raise blad',
    '',
    'pad = polacz_pad()',
    'hub.display.icon(Icon.TRUE)',
    '',
    'while True:',
    '    try:',
    '        lt, rt = pad.triggers()',
    '        speed = (rt - lt) * MAX / 100',
    '        turn = pad.joystick_left()[0] * MAX / 200',
    '        if abs(speed) < 8 and abs(turn) < 8:',
    '            robot.stop()',
    '        else:',
    '            robot.drive(speed, turn)',
    ...armControl,
    '        wait(10)',
    '    except OSError as blad:',
    `        print("Utrata polaczenia:", blad)`,
    `        print(${JSON.stringify(cableHint)})`,
    '        print("Jesli pad zgasl: wlacz go i daj w tryb parowania.")',
    '        try:',
    '            robot.stop()',
    ...armStop,
    '        except OSError:',
    '            pass',
    '        try:',
    '            pad.disconnect()',
    '        except Exception:',
    '            pass',
    '        wait(500)',
    '        pad = polacz_pad()',
    '        hub.display.icon(Icon.TRUE)',
    '',
  ].join('\n');
  return `${preamble}${body}`;
}
