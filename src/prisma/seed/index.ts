import {PrismaClient} from "@prisma/client";
import * as fs from 'fs';

interface Doc {
  hgnc_id: string;
  symbol: string; // this
  name: string;
  locus_group: string;
  locus_type: string;
  status: string;
  location: string;
  location_sortable: string;
  alias_symbol: string[]; // this
  alias_name: string[];
  prev_symbol: string[];
  prev_name: string[];
  gene_family: string[];
  gene_family_id: string[];
}

const prisma = new PrismaClient()

async function main() {

  const hugo_json = fs.readFileSync('/Users/artonio/DEV/nestjs/hugo-symbol-job/src/prisma/seed/hgnc_complete_set_2023-05-01_formatted.json', 'utf8');
  const hugo = JSON.parse(hugo_json);
  const docs: any[] = hugo.response.docs;

  let symbol_length = 0;
  let alias_length = 0;

  for (const doc of docs) {
    console.log('processing symbol', doc.symbol);
    if (doc.symbol.length > symbol_length) {
      symbol_length = doc.symbol.length;
    }
    if (doc.alias_symbol?.length > alias_length) {
      alias_length = doc.alias_symbol?.length;
    }
    await prisma.hugo_symbol.create({
      data: {
        symbol: doc.symbol,
        aliases: {
          create: doc.alias_symbol?.map((alias: string) => {
            return {
              alias: alias
            }
          })
        }
      },
    })
  }

  console.log(symbol_length);
  console.log(alias_length);

}

main().then(() => {
  console.log('done')
}).catch(e => {
  console.error(e)
}).finally(async () => {
  await prisma.$disconnect()
})
