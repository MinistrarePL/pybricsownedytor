import { Gamepad2, TriangleAlert } from 'lucide-react';
import { clampXboxSpeed, xboxArmDevice, XBOX_SPEED_MAX, XBOX_SPEED_MIN } from '../xboxDrive.ts';
import type { RobotProfile } from '../types.ts';

interface Props {
  robot: RobotProfile;
  modelName: string;
  maxSpeed: number;
  onMaxSpeed: (value: number) => void;
  onOpenModels: () => void;
}

export function GamepadPanel({ robot, modelName, maxSpeed, onMaxSpeed, onOpenModels }: Props) {
  const canDrive = Boolean(robot.driveBase);
  const arm = xboxArmDevice(robot);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto bg-slate-100 px-6 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <header className="flex items-start gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Gamepad2 className="size-8" strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Pilot pada Xbox</h1>
            <p className="mt-1 font-semibold text-slate-500">
              Hub łączy się z padem przez Bluetooth. Model: {modelName}.
            </p>
          </div>
        </header>

        {!canDrive && (
          <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-amber-950">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" strokeWidth={2.4} />
            <div>
              <p>Ten model nie jeździ. Wybierz robota z kołami, na przykład „Training Camp 2” albo „Robot jeżdżący”.</p>
              <button
                type="button"
                onClick={onOpenModels}
                className="mt-3 h-10 rounded-xl bg-amber-600 px-4 font-extrabold text-white transition hover:bg-amber-700"
              >
                Otwórz modele
              </button>
            </div>
          </div>
        )}

        <section className="rounded-3xl border border-amber-200 bg-amber-50/90 p-5">
          <h2 className="text-sm font-black text-amber-950">Jak uruchomić</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm font-semibold leading-relaxed text-amber-950/90">
            <li>Włącz pada Xbox. Przy pierwszym razie przytrzymaj przycisk parowania z tyłu, aż logo Xbox zacznie szybko migać.</li>
            <li>Połącz edytor z hubem (nie paruj huba w ustawieniach systemu).</li>
            <li>Naciśnij zielony przycisk — program czeka na pada, potem na hubie pojawi się ptaszek.</li>
            <li>
              RT jedzie do przodu, LT do tyłu, lewy stick skręca.
              {arm ? ' Krzyżak góra/dół rusza dźwignią.' : ''} Czerwony Stop kończy program.
            </li>
          </ol>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black text-slate-800">Gdy nagle przestanie działać</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm font-semibold text-slate-600">
            <li>„not allowed to read buttons” — pad nie jest w trybie parowania. Przytrzymaj mały przycisk z tyłu, aż logo szybko miga, i uruchom pilota jeszcze raz.</li>
            <li>ENODEV / „sensor or motor is not connected” — poluzował się kabel koła (u Training Camp 2: C, D) albo ramienia (E). Dociśnij kable i uruchom ponownie.</li>
            <li>Pad po kilku minutach może zasnąć. Włącz go znowu. Jeśli łączył się z konsolą Xbox, zrób parowanie od nowa.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-black text-slate-800">Sterowanie</h2>
          <ul className="mt-3 space-y-2 text-sm font-semibold text-slate-600">
            <li>RT — do przodu</li>
            <li>LT — do tyłu</li>
            <li>Lewy stick w lewo / w prawo — skręt</li>
            {arm && (
              <li>{`Krzyżak (ten z plusem) góra — podnosi ${arm.name}; dół — opuszcza (port ${arm.port})`}</li>
            )}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <label htmlFor="xbox-speed" className="flex items-center justify-between text-sm font-black text-slate-800">
            <span>Maksymalna prędkość</span>
            <span className="font-extrabold text-sky-600">{maxSpeed} mm/s</span>
          </label>
          <input
            id="xbox-speed"
            type="range"
            min={XBOX_SPEED_MIN}
            max={XBOX_SPEED_MAX}
            step={50}
            value={maxSpeed}
            disabled={!canDrive}
            onChange={(event) => onMaxSpeed(clampXboxSpeed(Number(event.target.value)))}
            className="mt-3 w-full accent-sky-500 disabled:opacity-40"
          />
          <p className="mt-2 text-xs font-semibold text-slate-400">
            Od {XBOX_SPEED_MIN} do {XBOX_SPEED_MAX}. Wolniej jest łatwiej na starcie.
          </p>
        </section>
      </div>
    </div>
  );
}
