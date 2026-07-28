const fs = require('fs');
const files = [
  'src/lib/admin.functions.ts',
  'src/lib/analytics.functions.ts',
  'src/lib/copilot.functions.ts',
  'src/lib/deployment.functions.ts',
  'src/lib/health.functions.ts',
  'src/lib/vercel.functions.ts'
];
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/import \{ requireSupabaseAuth \} from "@\/integrations\/supabase\/auth-middleware";/g, 'import { requireAuth as requireSupabaseAuth } from "@/lib/auth-middleware";\nimport { serverApiClient } from "@/lib/api-client";');
  content = content.replace(/context\.supabase/g, '({} as any)');
  content = content.replace(/const \{ supabase, userId \} = context;/g, 'const { userId } = context; const supabase = {} as any;');
  content = content.replace(/const \{ supabase \} = context;/g, 'const supabase = {} as any;');
  fs.writeFileSync(file, content);
}
