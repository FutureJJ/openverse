# Openverse

An open-source sandbox MMORPG that runs in your browser. Voxel-building,
crafting, farming, fishing, quests, and player-to-player trading — all
streamed in real time over WebSockets, with a fully destructible world
rendered through WebAssembly and React.

### Stack

- **Frontend**: Next.js + TypeScript + React + WebAssembly (custom voxel engine)
- **Backend**: Distributed Node.js microservices (web, sync, logic, gaia, anima, ...)
- **Storage**: Redis (game state, sessions, content)
- **Build**: Bazel for the C++/Rust voxel core (Galois/voxeloo)

### Status

Openverse is in active development as a fork of [Biomes](https://github.com/ill-inc/biomes-game).
Currently being adapted to run independently of Google Cloud (the original
production backend), so it can be self-hosted on any Linux server.

### Running locally

Documentation will be published as the self-host port stabilizes. For now
the original Biomes setup notes mostly apply — see `docs/`.

### License

MIT. See [LICENSE](LICENSE). Forked from [Biomes](https://github.com/ill-inc/biomes-game)
© 2023 Global Illumination, Inc., with gratitude for releasing the codebase.
