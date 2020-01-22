import { StatelessWidget, Column, Container, Text, Element, Widget } from './framework';
import { PreferredSizeWidget } from './PreferredSizeWidget';

export class Scaffold extends StatelessWidget {
  body: Widget;
  appBar: PreferredSizeWidget;

  constructor({ body, appBar }: { body: Widget; appBar: PreferredSizeWidget }) {
    super(null);

    this.body = body;
    this.appBar = appBar;
  }

  build() {
    return Column({
      children: [Container({ child: this.appBar, height: this.appBar.preferredSize.height }), this.body],
    });
  }
}
