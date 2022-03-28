import { User } from '../../utils/types'
import actions from './actionLang'

const updateUser = (user: User) => {
    return {
        type: actions.UPDATE_USER,
        payload: { user }
    }
}

const clearUser = () => {
    return {
        type: actions.CLEAR_USER
    }
}

const userActions = {
    updateUser,
    clearUser
}

export default userActions