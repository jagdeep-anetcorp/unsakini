module Unsakini

  class UsersController < BaseController

    include LoggedInControllerConcern
    include ::ActionController::Serialization

    skip_before_action :ensure_logged_in, only: [:create, :confirm]

    #Creates a new user
    def create
      user = User.new(user_params)

      if user.save
        UserMailer.confirm_account(user).deliver_now
        render json: user, status: :created
      else
        render json: user.errors, status: 422
      end
    end

    # confirm user account
    def confirm
      token = params[:token].to_s

      user = User.find_by(confirmation_token: token)

      if user.present? && user.confirmation_token_valid?
        if user.mark_as_confirmed!
          render json: {status: 'Account confirmed successfully.'}
        else
          render json: user.errors, status: 422
        end
      else
        render json: ['Invalid token'], status: :not_found
      end
    end

    # Renders the current user as json
    #
    # `GET /api/user/:id`
    #
    def show
      render json: @user
    end

    # Returns the user with matching email
    #
    # `GET /api/users/search?email=xxx`
    #
    def search
      user = User.where("email = ? AND id != ?", params[:email], @user.id).first
      if user
        render json: user
      else
        render json: {}, status: :not_found
      end
    end

    private

    def user_params
      params.permit(:name, :email, :password, :password_confirmation)
    end

  end


end
