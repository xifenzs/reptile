import superagent from 'superagent'
import cheerio from 'cheerio'
import path from 'path'
import fs from 'fs'
interface titArr {
    title: string
}
interface jsonInfo{
    time: number
    data:titArr[]
}
interface Content{
    [propName: number]: titArr[]
}
class Reptile{
    // 抓取页地址
    private url = 'http://learning.sohu.com/?spm=smpc.news-home.header.7.1581253605515BC7xm9o'
    // 写入本地的目录文件路径
    private writePath =  path.resolve(__dirname, '../data/data.json')
    // 获取页面内容
    async getHTML(){
        const result = await superagent.get(this.url)
        return result.text
    }
    // 获取指定内容
    getDescInfo(html:string){
        const $ = cheerio.load(html)
        const list = $(".z-head-news_item")
        const titleArr:titArr[] = []
        list.map((index, ele) => {
            const itemTit = $(ele).find('a')
            const title = itemTit.text()
            titleArr.push({
                title
            })
        })
        return {
            time: new Date().getTime(),
            data: titleArr
        }
    }
    // 处理数据
    transfromData(data:jsonInfo){
        let fileContent:Content = {}
        if(fs.existsSync(this.writePath)){ //判断是否含有该文件
            fileContent = JSON.parse(fs.readFileSync(this.writePath, 'utf-8'))
        }
        fileContent[data.time] = data.data
        return fileContent
    }
    // 生成文件
    writeFile(res:string){
        fs.writeFileSync(this.writePath, res)
    }
    // 初始化
    async init(){
        const html = await this.getHTML()
        const data = this.getDescInfo(html)
        const res =  this.transfromData(data)
        this.writeFile(JSON.stringify(res))
    }
    constructor(){
        this.init()
    }
}

new Reptile()