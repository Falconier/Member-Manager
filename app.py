from flask import Flask, jsonify, request, render_template
import pyodbc
import os
import dotenv import load_dotenv

app = Flask(__name__, template_folder='templates', static_folder='static')

conn_str = (f"DRIVER={os.getenv('DB_DRIVER')};"
            f"SERVER={os.getenv('DB_SERVER')};"
            f"DATABASE={os.getenv('DB_NAME')};"
            f"UID={os.getenv('DB_USER')};"
            f"PWD={os.getenv('DB_PASSWORD')};")

def get_db_connection():
    try:
        conn = pyodbc.connect(conn_str)
        return conn
    except pyodbc.Error as e:
        print(f"Connection failed: {e}")
        raise

@app.route('/members', methods=['GET'])
def get_members():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT member_id, first_name, last_name, email, phone, address, city, state, zip_code FROM Members")
    rows = cursor.fetchall()
    members = [
        {
            'member_id': row.member_id,
            'first_name': row.first_name,
            'last_name': row.last_name,
            'email': row.email,
            'phone': row.phone,
            'address': row.address,
            'city': row.city,
            'state': row.state,
            'zip_code': row.zip_code
        } for row in rows
    ]
    conn.close()
    return jsonify(members)

@app.route('/members/<int:member_id>/talents', methods=['GET'])
def get_member_talents(member_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT tc.category_name, t.talent_name, tt.notes
        FROM TimeAndTalent tt
        JOIN TalentCategories tc ON tt.category_id = tc.category_id
        JOIN Talents t ON tt.predefined_talent_id = t.talent_id
        WHERE tt.member_id = ?
    """, (member_id,))
    rows = cursor.fetchall()
    talents = [
        {
            'category_name': row.category_name,
            'talent_name': row.talent_name,
            'notes': row.notes
        } for row in rows
    ]
    conn.close()
    return jsonify(talents)

@app.route('/members/<int:member_id>/talent-ids', methods=['GET'])
def get_member_talent_ids(member_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT predefined_talent_id FROM TimeAndTalent WHERE member_id = ?", (member_id,))
    rows = cursor.fetchall()
    talent_ids = [row.predefined_talent_id for row in rows]
    conn.close()
    return jsonify(talent_ids)

@app.route('/members/by-talents', methods=['POST'])
def get_members_by_talents():
    data = request.get_json()
    talent_ids = data.get('talent_ids', [])
    if not talent_ids:
        return jsonify([])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    placeholders = ','.join(['?'] * len(talent_ids))
    query = f"""
        SELECT DISTINCT m.member_id, m.first_name, m.last_name, m.email, m.phone, m.address, m.city, m.state, m.zip_code
        FROM Members m
        JOIN TimeAndTalent tt ON m.member_id = tt.member_id
        WHERE tt.predefined_talent_id IN ({placeholders})
    """
    cursor.execute(query, talent_ids)
    rows = cursor.fetchall()
    members = [
        {
            'member_id': row.member_id,
            'first_name': row.first_name,
            'last_name': row.last_name,
            'email': row.email,
            'phone': row.phone,
            'address': row.address,
            'city': row.city,
            'state': row.state,
            'zip_code': row.zip_code
        } for row in rows
    ]
    conn.close()
    return jsonify(members)

@app.route('/members', methods=['POST'])
def add_member():
    data = request.get_json()
    print("Add Member Data:", data)
    conn = get_db_connection()
    cursor = conn.cursor()
    
    member_id = data.get('member_id')
    if member_id:
        cursor.execute("SELECT COUNT(*) FROM Members WHERE member_id = ?", (member_id,))
        if cursor.fetchone()[0] > 0:
            conn.close()
            return jsonify({'message': 'Member ID already exists'}), 400
        
        try:
            cursor.execute("SET IDENTITY_INSERT Members ON")
            cursor.execute("""
                INSERT INTO Members (member_id, first_name, last_name, email, phone, address, city, state, zip_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (member_id, data['first_name'], data['last_name'], data.get('email'), 
                  data.get('phone'), data.get('address'), data.get('city'), data.get('state'), data.get('zip_code')))
            cursor.execute("SET IDENTITY_INSERT Members OFF")
            new_id = member_id
        except pyodbc.Error as e:
            cursor.execute("SET IDENTITY_INSERT Members OFF")
            print(f"Insert Error: {e}")
            conn.close()
            return jsonify({'message': f'Error inserting custom ID: {str(e)}'}), 400
    else:
        try:
            cursor.execute("""
                INSERT INTO Members (first_name, last_name, email, phone, address, city, state, zip_code)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (data['first_name'], data['last_name'], data.get('email'), 
                  data.get('phone'), data.get('address'), data.get('city'), data.get('state'), data.get('zip_code')))
            new_id = cursor.execute("SELECT @@IDENTITY").fetchone()[0]
        except pyodbc.Error as e:
            print(f"Insert Error: {e}")
            conn.close()
            return jsonify({'message': f'Error inserting member: {str(e)}'}), 400
    
    conn.commit()
    conn.close()
    return jsonify({'member_id': int(new_id)}), 201

@app.route('/members/<int:member_id>', methods=['PATCH'])
def update_member(member_id):
    data = request.get_json()
    print("Update Member Data:", data)
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE Members
            SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zip_code = ?
            WHERE member_id = ?
        """, (data['first_name'], data['last_name'], data.get('email'), data.get('phone'), 
              data.get('address'), data.get('city'), data.get('state'), data.get('zip_code'), member_id))
        conn.commit()
    except pyodbc.Error as e:
        print(f"Update Error: {e}")
        conn.close()
        return jsonify({'message': f'Error updating member: {str(e)}'}), 500
    conn.close()
    return jsonify({'message': 'Member updated successfully'}), 200

@app.route('/talent-categories', methods=['GET'])
def get_talent_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT category_id, category_name FROM TalentCategories")
    rows = cursor.fetchall()
    categories = [
        {
            'category_id': row.category_id,
            'category_name': row.category_name
        } for row in rows
    ]
    conn.close()
    return jsonify(categories)

@app.route('/talents', methods=['GET'])
def get_talents():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT talent_id, talent_name, category_id FROM Talents")
    rows = cursor.fetchall()
    talents = [
        {
            'talent_id': row.talent_id,
            'talent_name': row.talent_name,
            'category_id': row.category_id
        } for row in rows
    ]
    conn.close()
    return jsonify(talents)

@app.route('/members/<int:member_id>/talents', methods=['POST'])
def add_talent(member_id):
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM TimeAndTalent WHERE member_id = ?", (member_id,))
    for talent_id in data['predefined_talent_ids']:
        cursor.execute("SELECT category_id FROM Talents WHERE talent_id = ?", (talent_id,))
        category_id = cursor.fetchone()[0]
        cursor.execute("""
            INSERT INTO TimeAndTalent (member_id, category_id, predefined_talent_id, notes)
            VALUES (?, ?, ?, ?)
        """, (member_id, category_id, talent_id, data.get('notes')))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Talents updated successfully'}), 201

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/manage-members')
def manage_members():
    return render_template('manage_members.html')

@app.route('/manage-talents')
def manage_talents():
    return render_template('manage_talents.html')

@app.route('/reporting')
def reporting():
    return render_template('reporting.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)