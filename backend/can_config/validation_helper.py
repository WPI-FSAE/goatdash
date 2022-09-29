from functools import wraps


def validator(errorMsg):
    def decorator(function):
        @wraps(function)
        def wrapper(self, *args, **kwargs):
            if not function(self, *args, **kwargs):
                print("[Validation Error!]: target %s failed! \n\n[*] With Message:\n%s\n\n[*] On Object: \n%s\n====" %
                      (function.__qualname__, errorMsg, str(self)))
                return False
            return True
        return wrapper
    return decorator
