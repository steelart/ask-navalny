# Application debug default configuration

# Configuration affected both server and client
COMMON_APP_CONFIG = {
    'debug': True,
    # Serwer will send notifications about questions and answer changes
    'web_sockets': True,
    # Allow to register and login local users (set it to None to switch off)
    'local_users': {
        # Allow to register admin users via simple web form (for debug only)
        'admin_registration': True,
    },
    # Allow to login via social nets
    'social_auth': {
        'google': True,
    },
}

# Server specific configuration
SERVER_CONFIG = {
    # The first number should be exactly as in sever
    # The second number should be equal or more the server version
    # Configuration version is needed to check that propesed configuration is
    # compatible with server
    'config_version': [3, 1],

    'allowed_hosts': ['*'],

    # COOKIES filter to pass to main site, could be some string
    'debug_filter': None,

    # Django secret key
    'secret_key': ')x2@*8)x6dx0(00mynl%xj5lp*y66(zm-v61)i(6q8vwk$7b@2',

    'domain': 'localhost:8000',

    # How many questions we need to send when user press 'more' button
    'upload_questions_count': 3,

    # A configuration for application preload data
    # Preloaded questions will be used for fast keystrokes search
    'preload_config': {
        'answered_number': 100,
        'top_unanswered_number': 100,
        'new_unanswered_number': 100,
    },

    'auth_config': None,
    # A template to configure social nets authentication
    # As alternative social nets auth could be configured by /admin menu
    #'auth_config': {
    #    'google': {
    #        'secret': 'XXXXXXXXXXXXXXXXXXXXXXXX',
    #        'client_id': 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    #    }
    #},
}
