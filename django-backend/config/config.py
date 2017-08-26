# Use default debug configuration or local configuration
try:
    from .config_local import *
except ImportError:
    from .config_default import *
