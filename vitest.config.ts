import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    server: {
      deps: {
        inline: [
          '@mui/material',
          '@mui/system',
          '@emotion/react',
          '@emotion/styled',
          'react-transition-group',
        ],
      },
    },
  },
});
