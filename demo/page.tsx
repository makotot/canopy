import Header from './header';
import Stats from './stats';
import Chart from './chart';
import ActivityFeed from './activity-feed';

export default function Page() {
  return (
    <main>
      <Header />
      <section>
        <Stats />
        <Chart />
      </section>
      <ActivityFeed />
    </main>
  );
}
