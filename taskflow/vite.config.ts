// import { defineConfig } from "vite";
// import vinext from "vinext";
// import { cloudflare } from "@cloudflare/vite-plugin";
// import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";

// export default defineConfig({
//   plugins: [
//     vinext({
//       prerender: { routes: "*" },
//       images: { optimizer: imagesOptimizer() },
//     }),
//     cloudflare({
//       viteEnvironment: {
//         name: "rsc",
//         childEnvironments: ["ssr"],
//       },
//     }),
//   ],
// });


import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { imagesOptimizer } from "@vinext/cloudflare/images/images-optimizer";
import { staticAssetsAdapter } from "@vinext/cloudflare/cache/static-assets-adapter";

export default defineConfig({
  plugins: [
    vinext({
      prerender: { routes: "*" },
      cache: {
        cdn: staticAssetsAdapter(),
      },
      images: { optimizer: imagesOptimizer() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});