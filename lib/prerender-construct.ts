import { Construct } from "@aws-cdk/core";
import { Bundling } from '@aws-cdk/aws-lambda-nodejs/lib/bundling';
import { Runtime } from '@aws-cdk/aws-lambda';
import { experimental } from '@aws-cdk/aws-cloudfront';
import { EdgeFunction } from "@aws-cdk/aws-cloudfront/lib/experimental";

export interface PrerenderFunctionOptions {
    redirectBackendOrigin: string,
    redirectFrontendHost: string,
    prerenderToken: string
}

export class PrerenderFunction extends Construct {
    readonly edgeFunction: EdgeFunction;

    constructor(scope: Construct, id: string, options: PrerenderFunctionOptions) {
        super(scope, id);

        this.edgeFunction = new experimental.EdgeFunction(
            this,
            'PrerenderFunction',
            {
              code: Bundling.bundle({
                entry: `${__dirname}/handlers/prerender.ts`,
                runtime: Runtime.NODEJS_12_X,
                depsLockFilePath: `${__dirname}/handlers/package-lock.json`,
                // Define options replace values at build time so we can use environment variables to test locally
                // and replace during build/deploy with static values. This gets around the lambda@edge limitation
                // of no environment variables at runtime.
                define: {
                  'process.env.REDIRECT_BACKEND': JSON.stringify(options.redirectBackendOrigin),
                  'process.env.REDIRECT_FRONTEND_HOST': JSON.stringify(options.redirectFrontendHost),
                  'process.env.PRERENDER_TOKEN': JSON.stringify(options.prerenderToken)
                }
              }),
              runtime: Runtime.NODEJS_12_X,
              handler: 'index.handler',
            }
          );
    }
}