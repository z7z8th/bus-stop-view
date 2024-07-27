import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// import watch from 'watch'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { platform } from 'node:process'

async function postBuildCommands() {
  if (platform == 'win32') {
    return
  }
  if (!fs.existsSync('./dist/')) {
    return
  }

  let git_rev = execSync('git rev-parse --short HEAD')
  let date = new Date() //('yyyy.MM.dd-hh.mm.ss-TT')
  date = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}${date.getSeconds().toString().padStart(2, '0')}`
  let basename = `bus-stop-view-${git_rev.toString().trim()}-${date}`

  let output = execSync(`set -e;
    mkdir -p "dist-win/${basename}";
    cp -r -v win/. dist/. "dist-win/${basename}/.";
    cd dist-win/;
    zip -r "${basename}.zip" "${basename}";
    [ -d /opt/VM/share ] && rsync -rltv ./ /opt/VM/share/bus-stop-view-dist-win/;
    echo '========== package done =========='
    `)

  console.log(`cmd output ${output.toString()}`)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    {
      name: 'postbuild-commands', // the name of your custom plugin. Could be anything.
      closeBundle: async () => {
        await postBuildCommands() // run during closeBundle hook. https://rollupjs.org/guide/en/#closebundle
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    watch: {
      include: './dist/*'
    },
    minify: false
  },
  server: {
    proxy: {
      '^/(busline|Line)': {
        target: 'http://xuzhou.bus.iecity.com/',
        changeOrigin: true
        // rewrite: (path) => path.replace(/^\/proxy/, '')
      }
    }
  }
})
