import pass from "./pass.json" assert {type: "json"};
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(pass.co, pass.anon);

async function fetchData()
{
    const dataMessage = await supabase
        .from("main")
        .select();

    const data = await supabase
        .channel('supabase_realtime')
        .on('postgres_changes', { event: "*", schema: 'public', table: 'main' },
        (payload) => {
            console.log(payload);
        })
        .subscribe();
    
    return dataMessage;
}


export const fetchDataExport = fetchData();