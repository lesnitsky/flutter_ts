import { Size, Widget } from './framework';

export abstract class PreferredSizeWidget extends Widget {
  abstract get preferredSize(): Size;
}
