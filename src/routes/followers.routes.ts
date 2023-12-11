import { Router } from 'express'
import { followController, unfollowController } from '~/controllers/users.controller'
import {
  accessTokenValidator,
  followValidator,
  unfollowValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handlers'

const followerRoutes = Router()

/**
 * Description: Follow a user
 * Path: /users/follow
 * Method: POST
 * Headers: { Authorization: Bearer <access_token> }
 * body: { followed_user_id: string }
 */
followerRoutes.post('/', accessTokenValidator, verifiedUserValidator, followValidator, wrapAsync(followController))

/**
 * Description: Unfollow a user
 * Path: /users/follow
 * Method: DELETE
 * Headers: { Authorization: Bearer <access_token> }
 * body: { followed_user_id: string }
 */
followerRoutes.delete(
  '/:followed_user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapAsync(unfollowController)
)

export default followerRoutes
