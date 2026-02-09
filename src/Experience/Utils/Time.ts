import { Clock, EventDispatcher } from 'three';

export default class Time extends EventDispatcher<{
  tick: {};
}> {
  constructor() {
    super();

    // Setup
    this.clock = new Clock();

    // Wait one frame
    requestAnimationFrame(() => {
      this.tick();
    });
  }

  public clock: Clock;

  public tick() {
    // Update
    this.dispatchEvent({ type: 'tick' });

    // Animation
    requestAnimationFrame(() => {
      this.tick();
    });
  }
}
