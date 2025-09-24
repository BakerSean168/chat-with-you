export default defineEventHandler(async (event) => {
  return {
    status: 'success',
    message: '服务器运行正常！',
    timestamp: new Date().toISOString(),
    port: 4000
  }
})