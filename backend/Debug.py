
MAX_BUF_SIZE = 256

class Debug:

    def __init__(self, n):
        self.new_msg = False

        if n == 0:
            self.msgs = [""] * MAX_BUF_SIZE
        else:
            self.msgs = [""] * n
            
        self.idx_read = 0
        self.idx_write = 0

    def msg_avail(self):
        return not self.idx_read == self.idx_write

    def get_msg(self):
        msg = ""
        if self.idx_read != self.idx_write:
            msg = self.msgs[self.idx_read]
            self.msgs[self.idx_read] = ""

            self.idx_read += 1

            if self.idx_read >= MAX_BUF_SIZE:
                self.idx_read = 0

        return msg

    def get_msgs(self, n):
        msgs = []
        for i in range(n):
            if not self.msg_avail():
                break

            msgs.append(self.get_msg())
        
        return msgs

    def put_msg(self, msg):
        self.msgs[self.idx_write] = msg
        self.idx_write += 1

        if self.idx_write >= MAX_BUF_SIZE:
            self.idx_write = 0

        # Handle overwriting last value
        if self.idx_write == self.idx_read:
            self.idx_read += 1

            if self.idx_read >= MAX_BUF_SIZE:
                self.idx_read = 0

        