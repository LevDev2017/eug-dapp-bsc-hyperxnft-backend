
const delay = async (ms) => {
    await new Promise((res) => {
        setTimeout(res, ms)
    })
}

module.exports = { delay };
