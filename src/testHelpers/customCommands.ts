// Taken from https://github.com/vitest-dev/vitest/issues/8099
import type { Plugin } from 'vitest/config'

type OptionsPointer = {
  /**
   * Defaults to `left`.
   */
  button?: 'left' | 'right' | 'middle'

  /**
   * defaults to 1. See [UIEvent.detail].
   */
  clickCount?: number
}

type OptionsMove = {
  /**
   * Defaults to 1. Sends intermediate `mousemove` events.
   */
  steps?: number
}

const error = (e: string) => {
  throw new Error(e)
}

export default function VitestMousePlugin(): Plugin {
  return {
    name: 'custom:vitest:mouse-commands',
    config() {
      return {
        test: {
          browser: {
            commands: {
              mouseDown: (ctx, opts?: OptionsPointer) => ctx.page.mouse.down(opts),
              mouseUp: (ctx, opts?: OptionsPointer) => ctx.page.mouse.up(opts),
              mouseWheel: (ctx, deltaX: number, deltaY: number) => ctx.page.mouse.wheel(deltaX, deltaY),
              mouseMove: async (ctx, x: number, y: number, opts?: OptionsMove) => {
                const frame = await ctx.frame()
                const element = await frame.frameElement()
                const boundingBox = (await element.boundingBox()) ?? error('No frame bounding box?!!')

                const frameScale =
                  (await ctx.iframe.owner().locator('xpath=..').getAttribute('data-scale')) ?? error('No scale?!!')

                const scaledX = x * parseFloat(frameScale)
                const scaledY = y * parseFloat(frameScale)
                return ctx.page.mouse.move(boundingBox.x + scaledX, boundingBox.y + scaledY, opts)
              },
            },
          },
        },
      }
    },
  }
}

declare module '@vitest/browser/context' {
  interface BrowserCommands {
    mouseDown: (opts?: OptionsPointer) => Promise<void>
    mouseUp: (opts?: OptionsPointer) => Promise<void>
    mouseMove: (x: number, y: number, opts?: OptionsMove) => Promise<void>
    mouseWheel: (deltaX: number, deltaY: number) => Promise<void>
  }
}