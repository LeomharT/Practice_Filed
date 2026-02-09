import { Pane } from 'tweakpane';
import type { PaneConfig } from 'tweakpane/dist/types/pane/pane-config';

export class DebugPane extends Pane {
  constructor(opt?: PaneConfig) {
    super(opt);

    this.title = 'Debug Pane';
    this.element.parentElement!.style.width = '380px';

    if (location.hash !== '#debug') {
      this.hidden = true;
    }
  }
}
