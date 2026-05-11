import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const movies = [
  {
    title: "Die Hard",
    description: "An NYPD officer tries to save his wife and several others taken hostage by German terrorists during a Christmas party at the Nakatomi Plaza in Los Angeles.",
    releaseDate: new Date("1988-07-15"),
    tmdbId: "562",
    coverImage: "https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg",
    metadata: { director: "John McTiernan", cast: ["Bruce Willis", "Alan Rickman", "Bonnie Bedelia"] },
  },
  {
    title: "The Terminator",
    description: "A human soldier is sent from 2029 to 1984 to stop an almost indestructible cybernetic killing machine, already sent to kill Sarah Connor, whose unborn son is destined to lead humanity in a war against the machines.",
    releaseDate: new Date("1984-10-26"),
    tmdbId: "218",
    coverImage: "https://image.tmdb.org/t/p/w500/qvktm0BHcnmDpul4Hz01GIazWPr.jpg",
    metadata: { director: "James Cameron", cast: ["Arnold Schwarzenegger", "Linda Hamilton", "Michael Biehn"] },
  },
  {
    title: "Predator",
    description: "A team of commandos on a mission in a Central American jungle find themselves hunted by an extraterrestrial warrior.",
    releaseDate: new Date("1987-06-12"),
    tmdbId: "28",
    coverImage: "https://image.tmdb.org/t/p/w500/5qMgPYAhDqJe8mscBTbvB7biOdX.jpg",
    metadata: { director: "John McTiernan", cast: ["Arnold Schwarzenegger", "Carl Weathers", "Jesse Ventura"] },
  },
  {
    title: "RoboCop",
    description: "In a dystopic and crime-ridden Detroit, a terminally wounded cop returns to the force as a powerful cyborg haunted by submerged memories.",
    releaseDate: new Date("1987-07-17"),
    tmdbId: "5928",
    coverImage: "https://image.tmdb.org/t/p/w500/6bCznHhJFHMMIHWoMrIsqCkN6Vv.jpg",
    metadata: { director: "Paul Verhoeven", cast: ["Peter Weller", "Nancy Allen", "Kurtwood Smith"] },
  },
  {
    title: "Lethal Weapon",
    description: "A veteran detective is partnered with a younger, unstable detective. Together they must deal with a gang of mercenaries and drug dealers.",
    releaseDate: new Date("1987-03-06"),
    tmdbId: "941",
    coverImage: "https://image.tmdb.org/t/p/w500/fmuNonNXfBBqjzpaIoNcEFKjnCq.jpg",
    metadata: { director: "Richard Donner", cast: ["Mel Gibson", "Danny Glover", "Gary Busey"] },
  },
  {
    title: "First Blood",
    description: "A veteran Green Beret is forced by a cruel Sheriff and his deputies to flee into the mountains and wage an escalating one-man war against his pursuers.",
    releaseDate: new Date("1982-10-22"),
    tmdbId: "1368",
    coverImage: "https://image.tmdb.org/t/p/w500/differently.jpg",
    metadata: { director: "Ted Kotcheff", cast: ["Sylvester Stallone", "Richard Crenna", "Brian Dennehy"] },
  },
  {
    title: "Commando",
    description: "A retired elite Black Ops Commando launches a one man war against a group of South American criminals who have kidnapped his daughter.",
    releaseDate: new Date("1985-10-04"),
    tmdbId: "8329",
    coverImage: "https://image.tmdb.org/t/p/w500/differently2.jpg",
    metadata: { director: "Mark L. Lester", cast: ["Arnold Schwarzenegger", "Rae Dawn Chong", "Dan Hedaya"] },
  },
  {
    title: "Top Gun",
    description: "As students at the United States Navy's elite fighter weapons school compete to be best in the class, one daring young pilot learns a few things from a civilian instructor.",
    releaseDate: new Date("1986-05-16"),
    tmdbId: "744",
    coverImage: "https://image.tmdb.org/t/p/w500/xUuHj3CgmZQ9P2cMaqQMBBWMVqD.jpg",
    metadata: { director: "Tony Scott", cast: ["Tom Cruise", "Kelly McGillis", "Val Kilmer"] },
  },
  {
    title: "Beverly Hills Cop",
    description: "A freewheeling Detroit cop pursues a murder investigation into the posh Beverly Hills, where his unorthodox methods are not entirely welcomed.",
    releaseDate: new Date("1984-12-05"),
    tmdbId: "90",
    coverImage: "https://image.tmdb.org/t/p/w500/differently3.jpg",
    metadata: { director: "Martin Brest", cast: ["Eddie Murphy", "Judge Reinhold", "John Ashton"] },
  },
  {
    title: "Raiders of the Lost Ark",
    description: "In 1936, archaeologist and adventurer Indiana Jones is hired by the U.S. government to find the Ark of the Covenant before the Nazis can obtain its awesome powers.",
    releaseDate: new Date("1981-06-12"),
    tmdbId: "85",
    coverImage: "https://image.tmdb.org/t/p/w500/ceG9VzoRAVGwivFU403Wc3AHRys.jpg",
    metadata: { director: "Steven Spielberg", cast: ["Harrison Ford", "Karen Allen", "Paul Freeman"] },
  },
];

const games = [
  {
    title: "Super Mario Bros.",
    description: "Run and jump through the Mushroom Kingdom to rescue Princess Peach from Bowser in Nintendo's landmark side-scrolling platformer.",
    releaseDate: new Date("1985-09-13"),
    igdbId: "1074",
    metadata: { developer: "Nintendo", platforms: ["NES"], genres: ["Platform"] },
  },
  {
    title: "The Legend of Zelda",
    description: "Explore the land of Hyrule, collecting pieces of the Triforce of Wisdom to rescue Princess Zelda from the evil Ganon.",
    releaseDate: new Date("1986-02-21"),
    igdbId: "1074216",
    metadata: { developer: "Nintendo", platforms: ["NES"], genres: ["Action", "Adventure"] },
  },
  {
    title: "Pac-Man",
    description: "Navigate a maze eating dots and fruit while avoiding four colourful ghosts in the iconic arcade classic.",
    releaseDate: new Date("1980-05-22"),
    igdbId: "1079",
    metadata: { developer: "Namco", platforms: ["Arcade", "Atari 2600"], genres: ["Maze"] },
  },
  {
    title: "Donkey Kong",
    description: "Climb ladders and dodge barrels thrown by a giant ape to rescue a kidnapped woman in this landmark arcade platformer.",
    releaseDate: new Date("1981-07-09"),
    igdbId: "1704",
    metadata: { developer: "Nintendo", platforms: ["Arcade", "NES"], genres: ["Platform"] },
  },
  {
    title: "Tetris",
    description: "Arrange falling blocks of different shapes to clear lines and prevent the stack from reaching the top of the screen.",
    releaseDate: new Date("1984-06-06"),
    igdbId: "1716",
    metadata: { developer: "Alexey Pajitnov", platforms: ["Game Boy", "NES", "Arcade"], genres: ["Puzzle"] },
  },
  {
    title: "Mega Man 2",
    description: "Battle eight robot masters and their stages before taking on Dr. Wily's fortress in Capcom's beloved action-platformer.",
    releaseDate: new Date("1988-12-24"),
    igdbId: "1073",
    metadata: { developer: "Capcom", platforms: ["NES"], genres: ["Action", "Platform"] },
  },
  {
    title: "Contra",
    description: "Fight through jungles, bases, and alien lairs in this classic run-and-gun shooter, best known for its two-player co-op.",
    releaseDate: new Date("1987-02-20"),
    igdbId: "1702",
    metadata: { developer: "Konami", platforms: ["NES", "Arcade"], genres: ["Run and gun"] },
  },
  {
    title: "Castlevania",
    description: "Wield the Vampire Killer whip through Dracula's castle, battling monsters and bosses across 18 levels of gothic action.",
    releaseDate: new Date("1986-09-26"),
    igdbId: "1083",
    metadata: { developer: "Konami", platforms: ["NES"], genres: ["Action", "Platform"] },
  },
  {
    title: "Metroid",
    description: "Explore the alien planet Zebes as bounty hunter Samus Aran, uncovering secrets and battling the Space Pirates and Mother Brain.",
    releaseDate: new Date("1986-08-06"),
    igdbId: "1072",
    metadata: { developer: "Nintendo", platforms: ["NES"], genres: ["Action", "Adventure"] },
  },
  {
    title: "Mike Tyson's Punch-Out!!",
    description: "Train Little Mac through a circuit of colourful boxers to ultimately challenge the world heavyweight champion Mike Tyson.",
    releaseDate: new Date("1987-10-18"),
    igdbId: "7040",
    metadata: { developer: "Nintendo", platforms: ["NES"], genres: ["Sports", "Boxing"] },
  },
];

async function main() {
  console.log("Seeding 1980s action movies...");

  for (const movie of movies) {
    await prisma.mediaItem.upsert({
      where: { tmdbId_mediaType: { tmdbId: movie.tmdbId, mediaType: "MOVIE" } },
      update: {},
      create: {
        mediaType: "MOVIE",
        ...movie,
      },
    });
    console.log(`  ✓ ${movie.title} (${movie.releaseDate.getFullYear()})`);
  }

  console.log(`\nDone — ${movies.length} movies seeded.`);

  console.log("\nSeeding 1980s video games...");

  for (const game of games) {
    await prisma.mediaItem.upsert({
      where: { igdbId_mediaType: { igdbId: game.igdbId, mediaType: "GAME" } },
      update: {},
      create: {
        mediaType: "GAME",
        ...game,
      },
    });
    console.log(`  ✓ ${game.title} (${game.releaseDate.getFullYear()})`);
  }

  console.log(`\nDone — ${games.length} games seeded.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
