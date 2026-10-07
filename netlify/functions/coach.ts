import{createClient}from'@supabase/supabase-js';import{z}from'zod';import{createProvider}from'../lib/provider';
const inputSchema=z.object({transcript:z.string().trim().min(3).max(6000),question:z.string().min(2).max(600),model:z.string().min(2).max(3000)}).strict();
const reply=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
export default async function handler(request:Request){
 if(request.method!=='POST')return reply({error:'Method not allowed'},405);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'JSON body required'},415);
 if(Number(request.headers.get('content-length')||0)>20000)return reply({error:'Answer is too long'},413);
 const token=request.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)return reply({error:'AI feedback కోసం sign in చేయండి.'},401);
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY;if(!url||!key)return reply({error:'Account service ఇంకా configure కాలేదు.'},503);
 try{const raw=await request.text();if(raw.length>20000)return reply({error:'Answer is too long'},413);const parsed=inputSchema.safeParse(JSON.parse(raw));if(!parsed.success)return reply({error:'ఒక సరైన answer ఇవ్వండి (3–6000 characters).'},400);
 const client=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});const{data:{user},error:authError}=await client.auth.getUser(token);if(authError||!user)return reply({error:'Session ముగిసింది. మళ్లీ sign in చేయండి.'},401);
 const provider=createProvider(process.env);const{data:allowed,error:quotaError}=await client.rpc('consume_coach_quota');if(quotaError)return reply({error:'Coach limit check కాలేదు. తర్వాత ప్రయత్నించండి.'},503);if(!allowed)return reply({error:'ఈరోజు 30 AI reviews పూర్తయ్యాయి. Practice reviewతో కొనసాగించండి.'},429);
 const feedback=await provider.feedback(parsed.data);return reply({...feedback,provider:'ai'});
 }catch(error){if(error instanceof SyntaxError)return reply({error:'Invalid request JSON'},400);const msg=(error as Error).message;console.error('coach_request_failed',msg==='AI_NOT_CONFIGURED'?'not_configured':'service_error');return reply({error:msg==='AI_NOT_CONFIGURED'?'AI coach ఇంకా connect కాలేదు. Practice review ఉపయోగించండి.':'AI feedback ప్రస్తుతం అందుబాటులో లేదు. మీ answer అలాగే ఉంది; తర్వాత ప్రయత్నించండి.'},503);}
}
