import { EventDispatcher } from 'three';

export default class Sizes extends EventDispatcher<{
  resize: {};
}> {
  constructor() {
    super();

    // Setup
    this.updateSizes();

    // Resize events
    window.addEventListener('resize', () => {
      this.updateSizes();
      this.dispatchEvent({ type: 'resize' });
    });
  }

  public width: number = 0;

  public height: number = 0;

  public pixelRatio: number = 0;

  public updateSizes() {
    this.width = 480 - 32 * 2;
    this.height = 600 - 32 * 2;
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
  }
}
