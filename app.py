from flask import Flask, request, jsonify, send_file
from psycopg2 import connect, extras
from cryptography.fernet import Fernet
from dotenv import load_dotenv
from os import environ
from flask_cors import CORS

load_dotenv ()

app = Flask(__name__)
CORS(app)
key = Fernet.generate_key()
host = environ.get('DB_HOST')
port = environ.get('DB_PORT')
dbname = environ.get('DB_NAME')
username = environ.get('DB_USER')
password = environ.get('DB_PASSWORD')


def get_connection():
    conn = connect(host=host, port=port, dbname=dbname,
                   user=username, password=password)
    return conn


"""@app.get('/')
def home():
    conn=get_connection()
    cur=con.cursor()
    cur.execute("SELECT 4*2")
    result = cur.fetchone()
    print(result)
    return "Hello World!"""


@app.get('/api/users')
def get_users():
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('SELECT 2*2')
    users = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(users)


@app.post('/api/users')
def create_user():
    # print(request.get_json())
    new_user = request.get_json()
    username = new_user['username']
    email = new_user['email']
    password = Fernet(key).encrypt(bytes(new_user['password'], 'utf-8'))
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute(
        'insert into users (username, email, password) values (%s, %s, %s) returning *', (username, email, password))
    new_created_user = cur.fetchone()
    #print(new_created_user)
    conn.commit()
    cur.close()
    conn.close()
    print(username, email, password)
    return jsonify(new_created_user)


@app.delete('/api/users/<id>')
def delelte_users(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('delete from users where id=%s returning *', (id,))
    user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if user is None:
        return jsonify({'Message': 'User not found'})
    #print(user)
    return jsonify(user)


@app.put('/api/users/<id>')
def update_users(id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    new_user = request.get_json()
    username = new_user['username']
    email = new_user['email']
    password = Fernet(key).encrypt(bytes(new_user['password'], 'utf-8'))
    cur.execute(
        'update users set email = %s, password = %s, username = %s where id = %s returning *', (email, password, username, id))
    user_updated = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    if user_updated is None:
        return jsonify({'Message': 'User not found'}), 404
    #print(user_updated)
    return jsonify(user_updated)


@app.get('/api/users/<id>')
def get_user(id):
    print(id)
    conn = get_connection()
    cur = conn.cursor(cursor_factory=extras.RealDictCursor)
    cur.execute('select * from users where id = %s', (id,))
    user = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if user is None:
        return jsonify({'Message': 'User not found'}), 404
    #print(user)
    return jsonify(user)

@app.get('/')
def home():
    return send_file('static/index.html')
if __name__ == '__main__':
    app.run(debug=True)
