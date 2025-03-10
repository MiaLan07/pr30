module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
      version: '1.0.0',
      description: 'This is the API documentation for the project.',
    },
  paths: {
    '/register': {
      post: {
        summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                	properties: {
                    username: { type: 'string' },
                    password: { type: 'string' },
                		email: { type: 'string' }
                  }
                }
            	}
        		}
    			},
    		responses: {
    			201: {
    				description: 'User registered successfully'
    			}
    		}
    	}
    },
    '/login': {
    	post: {
        summary: 'Login a user',
        requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									username: { type: 'string' },
									password: { type: 'string' }
								}
							}
						}
					}
        },
        responses: {
        	200: {
        		description: 'User logged in successfully'
        	}
        }
      }
    }
  }
};