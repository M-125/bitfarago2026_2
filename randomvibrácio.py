from random import randint
vibr=[]
for e in range(10,110,10):
    vibr.append([e,randint(-50,50),randint(-50,50)])
for e in vibr:
    print(str(e[0])+"%{transform:translate("+f"{e[1]}px,{e[2]}px)"+"}"         )
for e in vibr:
    print(str(e[0])+"%{transform:translate("+f"{-e[1]}px,{-e[2]}px)"+"}"         )