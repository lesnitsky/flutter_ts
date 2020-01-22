import { StatelessWidget, Container, Text, runApp } from './framework';
import { Scaffold } from './Scaffold';
import { AppBar } from './AppBar';

class App extends StatelessWidget {
  build() {
    return new Scaffold({
      appBar: new AppBar({ title: Text('Almost Flutter') }),
      body: Container({
        child: Text('Hello world'),
      }),
    });
  }
}

runApp(new App());
