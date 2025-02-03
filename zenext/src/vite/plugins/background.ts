const config = {
  name: 'background',
  file: 'background/index.ts',
  manifestEntries: [
    {
      background: {
        type: 'module',
        service_worker: 'background.js',
      },
    },
  ],
}
