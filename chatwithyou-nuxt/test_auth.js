// 测试认证token的对话创建
const testAuthenticatedConversationCreation = async () => {
    try {
        // 1. 登录获取token
        console.log('1. 登录获取token...')
        const loginResponse = await fetch('http://127.0.0.1:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: '123456'
            })
        })

        const loginData = await loginResponse.json()
        console.log('登录结果:', loginData.success ? 'SUCCESS' : 'FAILED')

        if (!loginData.success) {
            console.error('登录失败:', loginData.error)
            return
        }

        const token = loginData.data.token
        console.log('获取到token:', token ? 'YES' : 'NO')

        // 2. 获取角色ID
        console.log('2. 获取角色列表...')
        const charactersResponse = await fetch('http://127.0.0.1:3000/api/characters')
        const charactersData = await charactersResponse.json()

        if (!charactersData.success || !charactersData.data.length) {
            console.error('获取角色失败')
            return
        }

        const characterId = charactersData.data[0].id
        console.log('使用角色ID:', characterId)

        // 3. 使用token创建对话
        console.log('3. 创建对话...')
        const conversationResponse = await fetch('http://127.0.0.1:3000/api/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                characterId: characterId
            })
        })

        const conversationData = await conversationResponse.json()
        console.log('对话创建结果:', conversationData.success ? 'SUCCESS' : 'FAILED')

        if (conversationData.success) {
            console.log('对话ID:', conversationData.data.id)
        } else {
            console.error('对话创建失败:', conversationData.error || conversationData.message)
        }

    } catch (error) {
        console.error('测试出错:', error)
    }
}

// 运行测试
testAuthenticatedConversationCreation()