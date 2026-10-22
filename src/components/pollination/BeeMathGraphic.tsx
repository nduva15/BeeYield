import { motion } from "framer-motion";

/**
 * "Bee math" graphic: two 8-frame hives do not equal one 16-frame hive.
 * Recreated from the reference illustration with theme-friendly colours.
 */

const FrameBox = ({ frames }: { frames: number }) => (
  <div className="relative w-40 md:w-48">
    <div className="rounded-lg border-[6px] border-neutral-400 bg-white px-2 py-3 flex gap-1.5 justify-between">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 md:h-28 flex-1 rounded-sm border-2 border-neutral-400 bg-amber-50" />
      ))}
    </div>
    <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 h-20 w-20 rounded-full bg-white border-[5px] border-neutral-400 flex flex-col items-center justify-center">
      <span className="text-3xl font-bold text-neutral-500 leading-none">{frames}</span>
      <span className="text-[11px] font-medium text-neutral-400">Frames</span>
    </div>
  </div>
);

const Operator = ({ children }: { children: string }) => (
  <div className="h-14 w-14 rounded-full bg-white border-[5px] border-neutral-400 flex items-center justify-center text-2xl font-bold text-neutral-500 z-10">
    {children}
  </div>
);

const Bubble = ({ children, dashed = true }: { children: React.ReactNode; dashed?: boolean }) => (
  <div
    className={`rounded-full p-8 md:p-10 bg-teal-50 ${
      dashed ? "border-[5px] border-dashed border-amber-400" : ""
    }`}
  >
    <div className="pb-8">{children}</div>
  </div>
);

export const BeeMathGraphic = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex flex-col items-center gap-4"
    role="img"
    aria-label="Two 8-frame hives do not equal one 16-frame hive"
  >
    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
      <Bubble>
        <FrameBox frames={8} />
      </Bubble>
      <div className="md:-mx-4">
        <Operator>+</Operator>
      </div>
      <Bubble>
        <FrameBox frames={8} />
      </Bubble>
    </div>
    <div className="-my-2">
      <Operator>≠</Operator>
    </div>
    <Bubble>
      <div className="relative w-52 md:w-60 h-40 md:h-44">
        <div className="absolute left-0 top-0 w-40 md:w-48 rounded-lg border-[6px] border-neutral-400 bg-white px-2 py-3 flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 md:h-24 flex-1 rounded-sm border-2 border-neutral-400 bg-amber-50" />
          ))}
        </div>
        <div className="absolute right-0 top-8 w-40 md:w-48 rounded-lg border-[6px] border-neutral-400 bg-white px-2 py-3 flex gap-1.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 md:h-24 flex-1 rounded-sm border-2 border-neutral-400 bg-amber-50" />
          ))}
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 h-20 w-20 rounded-full bg-white border-[5px] border-neutral-400 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-neutral-500 leading-none">16</span>
          <span className="text-[11px] font-medium text-neutral-400">Frames</span>
        </div>
      </div>
    </Bubble>
  </motion.div>
);

export default BeeMathGraphic;
