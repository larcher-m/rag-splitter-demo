import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';

const tests = [
  { selector: '.main-area p' },
  { selector: '.article-content p' },
  { selector: '.post-content p' },
  {}
];

for (const options of tests) {
  const loader = new CheerioWebBaseLoader('https://juejin.cn/post/7660707431753678854', options);
  const docs = await loader.load();
  const len = docs.length > 0 ? docs[0].pageContent.length : 0;
  const sel = options.selector || '无选择器';
  console.log(`选择器 '${sel}' -> 文档数: ${docs.length}, 内容长度: ${len}`);
  if (len > 0) {
    console.log('  内容:', docs[0].pageContent.substring(0, 200));
  }
}