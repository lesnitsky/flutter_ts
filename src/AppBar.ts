import { PreferredSizeWidget } from './PreferredSizeWidget';
import { Size, Container, Widget } from './framework';

export class AppBar extends PreferredSizeWidget {
  title: Widget;

  constructor({ title }: { title: Widget }) {
    super(null);
    this.title = title;
  }

  get preferredSize() {
    return new Size({ width: Infinity, height: 70 });
  }

  build() {
    return Container({
      child: this.title,
    });
  }
}
